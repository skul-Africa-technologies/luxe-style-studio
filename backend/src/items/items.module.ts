import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { ItemsController } from './controllers/items.controller';
import { ItemsService } from './services/items.service';
import { Item, ItemSchema } from './entities/item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
    ]),

    // ✅ Proper JWT Module Import
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '7d' },
    }),
  ],

  controllers: [ItemsController],

  providers: [ItemsService],

  exports: [ItemsService],
})
export class ItemsModule {}
