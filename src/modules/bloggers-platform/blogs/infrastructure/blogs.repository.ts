// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'mongoose';
// import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

// import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';

// @Injectable()
// export class BlogsRepository {
//   constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

//   async findById(id: Types.ObjectId): Promise<BlogDocument | null> {
//     return this.BlogModel.findOne({
//       _id: id,
//       deletedAt: null,
//     });
//   }

//   async save(blog: BlogDocument) {
//     await blog.save();
//   }

//   async findOrNotFoundFail(id: Types.ObjectId): Promise<BlogDocument> {
//     const blog = await this.BlogModel.findOne({ _id: id, deletedAt: null });

//     if (!blog) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'Blog not found',
//       });
//     }

//     return blog;
//   }
// }
