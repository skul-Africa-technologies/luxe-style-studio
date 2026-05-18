import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ProductVariantsService } from '../services/product-variants.service';
import { CreateProductVariantDto, UpdateProductVariantDto } from '../dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public } from '../../common/decorators';
import { memoryStorage } from 'multer';

@ApiTags('product-variants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly variantsService: ProductVariantsService) {}

  /**
   * Create a new variant for a product (Admin only)
   * POST /product-variants
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({
    summary: 'Create product variant',
    description: 'Create a new variant (sub-item) for an existing product',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Variant created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request — missing productId or invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin access required' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
          callback(new BadRequestException('Only image files are allowed'), false);
        } else {
          callback(null, true);
        }
      },
    }),
  )
  async create(
    @Body() createVariantDto: CreateProductVariantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // If a file was uploaded, treat it as the variant image
    if (file) {
      const { cloudinary } = await import('cloudinary');
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      return new Promise<{ url: string; publicId: string }>(
        (resolve, reject) => {
          cloudinary.v2.uploader.upload_stream(
            {
              folder: 'luxe-style-studio/variants',
              resource_type: 'image',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
              ],
            },
            (error: any, result: any) => {
              if (error) {
                reject(
                  new BadRequestException('Failed to upload variant image to Cloudinary'),
                );
              } else if (result) {
                resolve({
                  url: result.secure_url,
                  publicId: result.public_id,
                });
              } else {
                reject(
                  new BadRequestException('No result from Cloudinary'),
                );
              }
            },
          ).end(file.buffer);
        },
      ).then((uploadResult) => {
        return this.variantsService.create({
          ...createVariantDto,
          image: uploadResult.url,
        });
      });
    }

    if (!createVariantDto.image) {
      throw new BadRequestException('Variant image is required');
    }

    return this.variantsService.create(createVariantDto);
  }

  /**
   * Get all variants for a single product (Public)
   * GET /product-variants/product/:productId
   */
  @Public()
  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get variants for a product',
    description: 'Retrieve all color/size variants for a given parent product',
  })
  @ApiResponse({ status: 200, description: 'List of variants for the product' })
  @ApiResponse({ status: 400, description: 'Bad Request — missing productId' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findByProduct(@Param('productId') productId: string) {
    return this.variantsService.findByProductId(productId);
  }

  /**
   * Get all variants — optionally filtered by productId (Admin only)
   * GET /product-variants?productId=
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({
    summary: 'Get all variants (Admin)',
    description: 'Retrieve all variants, optionally filtered by productId',
  })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of variants' })
  async findAll(@Query('productId') productId?: string) {
    return this.variantsService.findAll(productId);
  }

  /**
   * Get a single variant by ID (Public)
   * GET /product-variants/:id
   */
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get variant by ID',
    description: 'Retrieve a single product variant by its own ID',
  })
  @ApiResponse({ status: 200, description: 'Variant details' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }

  /**
   * Update a variant (Admin)
   * PATCH /product-variants/:id
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update product variant',
    description: 'Update one or more fields of an existing variant',
  })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin access required' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateProductVariantDto,
  ) {
    return this.variantsService.update(id, updateVariantDto);
  }

  /**
   * Delete a variant (Admin)
   * DELETE /product-variants/:id → 204 No Content
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product variant',
    description: 'Permanently remove a variant from the store',
  })
  @ApiResponse({ status: 204, description: 'Variant deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin access required' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async remove(@Param('id') id: string) {
    await this.variantsService.remove(id);
  }
}
