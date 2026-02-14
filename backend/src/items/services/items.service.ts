import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Item } from '../entities/item.entity';
import { CreateItemDto, UpdateItemDto } from '../dto';
import { PaginatedResult } from '../../common/interfaces';

/**
 * ItemsService - Handles all item-related business logic
 * Manages CRUD operations and image uploads to Cloudinary
 */
@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<Item>,
  ) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Create a new item
   * @param createItemDto - Item data
   * @param createdBy - Admin ID who created the item
   * @returns Created item
   */
  async create(createItemDto: CreateItemDto, createdBy?: string): Promise<Item> {
    const item = new this.itemModel({
      ...createItemDto,
      createdBy: createdBy ? new (require('mongoose').Types.ObjectId)(createdBy) : undefined,
    });
    return item.save();
  }

  /**
   * Get all items with pagination
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @param category - Optional category filter
   * @param search - Optional search query
   * @returns Paginated list of items
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
  ): Promise<PaginatedResult<Item>> {
    const query: any = { isActive: true };

    // Apply category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Apply search filter
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.itemModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.itemModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single item by ID
   * @param id - Item ID
   * @returns Item details
   */
  async findOne(id: string): Promise<Item> {
    const item = await this.itemModel.findById(id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  /**
   * Update an existing item
   * @param id - Item ID
   * @param updateItemDto - Updated item data
   * @returns Updated item
   */
  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.itemModel.findByIdAndUpdate(
      id,
      { $set: updateItemDto },
      { new: true, runValidators: true },
    );
    
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    
    return item;
  }

  /**
   * Soft delete an item (set isActive to false)
   * @param id - Item ID
   * @returns Deleted item
   */
  async remove(id: string): Promise<Item> {
    const item = await this.itemModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true },
    );
    
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    
    return item;
  }

  /**
   * Get all unique categories
   * @returns List of categories
   */
  async getCategories(): Promise<string[]> {
    return this.itemModel.distinct('category', { isActive: true });
  }

  /**
   * Upload image to Cloudinary
   * @param file - Image file buffer
   * @returns Cloudinary upload result with URL
   */
  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'luxe-style-studio',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Failed to upload image to Cloudinary'));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          } else {
            reject(new BadRequestException('No result from Cloudinary'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  }

  /**
   * Get item count
   * @returns Total number of active items
   */
  async getItemCount(): Promise<number> {
    return this.itemModel.countDocuments({ isActive: true });
  }
}
