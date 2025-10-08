import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateBlogInputDto } from 'src/modules/bloggers-platform/blogs/api/input-dto/blogs.input-dto';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let createdBlogId: string;

  // Важные константы для тестов
  const VALID_BLOG_DATA: CreateBlogInputDto = {
    name: 'Valid Blog Name',
    description: 'Valid blog description',
    websiteUrl: 'https://valid-url.com',
  };

  const INVALID_BLOG_DATA = {
    name: '', // слишком короткое
    description: 'de', // слишком короткое
    websiteUrl: 'invalid-url', // невалидный URL
  };

  const UPDATED_BLOG_DATA: CreateBlogInputDto = {
    name: 'Updated Blog Name',
    description: 'Updated blog description', 
    websiteUrl: 'https://updated-url.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    // Очищаем базу перед каждым тестом
    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /blogs', () => {
    it('should return empty array when no blogs exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/blogs')
        .expect(200);

      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return blogs with correct pagination', async () => {
      // Создаем несколько блогов
      const blog1 = await request(app.getHttpServer())
        .post('/blogs')
        .send(VALID_BLOG_DATA)
        .expect(201);

      const blog2 = await request(app.getHttpServer())
        .post('/blogs')
        .send({
          ...VALID_BLOG_DATA,
          name: 'Second Blog',
          websiteUrl: 'https://second-blog.com',
        })
        .expect(201);

      // Тестируем пагинацию
      const response = await request(app.getHttpServer())
        .get('/blogs?pageSize=1&pageNumber=2')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.pagesCount).toBe(2);
      expect(response.body.totalCount).toBe(2);
      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(1);
    });

    it('should search blogs by name', async () => {
      // Создаем блоги с разными именами
      await request(app.getHttpServer())
        .post('/blogs')
        .send({
          ...VALID_BLOG_DATA,
          name: 'JavaScript Blog',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/blogs')
        .send({
          ...VALID_BLOG_DATA,
          name: 'TypeScript News',
        })
        .expect(201);

      // Ищем по части имени
      const response = await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=Script')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].name).toContain('Script');
    });
  });

  describe('POST /blogs', () => {
    it('should create blog with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/blogs')
        .send(VALID_BLOG_DATA)
        .expect(201);

      // Проверяем структуру ответа
      expect(response.body).toEqual({
        id: expect.any(String),
        name: VALID_BLOG_DATA.name,
        description: VALID_BLOG_DATA.description,
        websiteUrl: VALID_BLOG_DATA.websiteUrl,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });

      // Сохраняем ID для последующих тестов
      createdBlogId = response.body.id;

      // Проверяем, что блог действительно создан
      const getResponse = await request(app.getHttpServer())
        .get('/blogs')
        .expect(200);

      expect(getResponse.body.items).toHaveLength(1);
      expect(getResponse.body.items[0].id).toBe(createdBlogId);
    });

    it('should return 400 when creating blog with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/blogs')
        .send(INVALID_BLOG_DATA)
        .expect(400);
    });

    it('should return 400 when websiteUrl is too long', async () => {
      const dataWithLongUrl = {
        ...VALID_BLOG_DATA,
        websiteUrl: `https://${'a'.repeat(100)}.com`, // Слишком длинный URL
      };

      await request(app.getHttpServer())
        .post('/blogs')
        .send(dataWithLongUrl)
        .expect(400);
    });
  });

  describe('GET /blogs/:id', () => {
    beforeEach(async () => {
      // Создаем блог для тестов
      const response = await request(app.getHttpServer())
        .post('/blogs')
        .send(VALID_BLOG_DATA)
        .expect(201);
      createdBlogId = response.body.id;
    });

    it('should return blog by existing ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blogs/${createdBlogId}`)
        .expect(200);

      expect(response.body).toEqual({
        id: createdBlogId,
        name: VALID_BLOG_DATA.name,
        description: VALID_BLOG_DATA.description,
        websiteUrl: VALID_BLOG_DATA.websiteUrl,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });
    });

    it('should return 404 for non-existing blog ID', async () => {
      const nonExistingId = '65f31a72c4d1caeef6f7b1a1'; // Valid ObjectId but doesn't exist
      
      await request(app.getHttpServer())
        .get(`/blogs/${nonExistingId}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app.getHttpServer())
        .get('/blogs/invalid-id-format')
        .expect(400);
    });
  });

  describe('PUT /blogs/:id', () => {
    beforeEach(async () => {
      // Создаем блог для обновления
      const response = await request(app.getHttpServer())
        .post('/blogs')
        .send(VALID_BLOG_DATA)
        .expect(201);
      createdBlogId = response.body.id;
    });

    it('should update existing blog with valid data', async () => {
      await request(app.getHttpServer())
        .put(`/blogs/${createdBlogId}`)
        .send(UPDATED_BLOG_DATA)
        .expect(204);

      // Проверяем, что блог действительно обновлен
      const response = await request(app.getHttpServer())
        .get(`/blogs/${createdBlogId}`)
        .expect(200);

      expect(response.body.name).toBe(UPDATED_BLOG_DATA.name);
      expect(response.body.description).toBe(UPDATED_BLOG_DATA.description);
      expect(response.body.websiteUrl).toBe(UPDATED_BLOG_DATA.websiteUrl);
    });

    it('should return 404 when updating non-existing blog', async () => {
      const nonExistingId = '65f31a72c4d1caeef6f7b1a1';
      
      await request(app.getHttpServer())
        .put(`/blogs/${nonExistingId}`)
        .send(UPDATED_BLOG_DATA)
        .expect(404);
    });

    it('should return 400 when updating with invalid data', async () => {
      await request(app.getHttpServer())
        .put(`/blogs/${createdBlogId}`)
        .send(INVALID_BLOG_DATA)
        .expect(400);
    });
  });

  describe('DELETE /blogs/:id', () => {
    beforeEach(async () => {
      // Создаем блог для удаления
      const response = await request(app.getHttpServer())
        .post('/blogs')
        .send(VALID_BLOG_DATA)
        .expect(201);
      createdBlogId = response.body.id;
    });

    it('should delete existing blog', async () => {
      await request(app.getHttpServer())
        .delete(`/blogs/${createdBlogId}`)
        .expect(204);

      // Проверяем, что блог действительно удален
      await request(app.getHttpServer())
        .get(`/blogs/${createdBlogId}`)
        .expect(404);

      // Проверяем, что в списке нет блогов
      const listResponse = await request(app.getHttpServer())
        .get('/blogs')
        .expect(200);

      expect(listResponse.body.items).toHaveLength(0);
    });

    it('should return 404 when deleting non-existing blog', async () => {
      const nonExistingId = '65f31a72c4d1caeef6f7b1a1';
      
      await request(app.getHttpServer())
        .delete(`/blogs/${nonExistingId}`)
        .expect(404);
    });

    it('should return 400 when deleting with invalid ID format', async () => {
      await request(app.getHttpServer())
        .delete('/blogs/invalid-id-format')
        .expect(400);
    });
  });

  describe('Blog Posts endpoints', () => {
    beforeEach(async () => {
      // Создаем блог для тестов постов
      const response = await request(app.getHttpServer())
        .post('/blogs')
        .send(VALID_BLOG_DATA)
        .expect(201);
      createdBlogId = response.body.id;
    });

    describe('GET /blogs/:blogId/posts', () => {
      it('should return empty posts array for blog without posts', async () => {
        const response = await request(app.getHttpServer())
          .get(`/blogs/${createdBlogId}/posts`)
          .expect(200);

        expect(response.body).toEqual({
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
      });

      it('should return 404 when getting posts for non-existing blog', async () => {
        const nonExistingId = '65f31a72c4d1caeef6f7b1a1';
        
        await request(app.getHttpServer())
          .get(`/blogs/${nonExistingId}/posts`)
          .expect(404);
      });
    });

    describe('POST /blogs/:blogId/posts', () => {
      const VALID_POST_DATA = {
        title: 'Valid Post Title',
        shortDescription: 'Valid short description',
        content: 'Valid post content that is long enough',
      };

      it('should create post for existing blog', async () => {
        const response = await request(app.getHttpServer())
          .post(`/blogs/${createdBlogId}/posts`)
          .send(VALID_POST_DATA)
          .expect(201);

        expect(response.body).toEqual({
          id: expect.any(String),
          title: VALID_POST_DATA.title,
          shortDescription: VALID_POST_DATA.shortDescription,
          content: VALID_POST_DATA.content,
          blogId: createdBlogId,
          blogName: VALID_BLOG_DATA.name,
          createdAt: expect.any(String),
          extendedLikesInfo: expect.any(Object),
        });

        // Проверяем, что пост появился в списке постов блога
        const postsResponse = await request(app.getHttpServer())
          .get(`/blogs/${createdBlogId}/posts`)
          .expect(200);

        expect(postsResponse.body.items).toHaveLength(1);
        expect(postsResponse.body.items[0].id).toBe(response.body.id);
      });

      it('should return 404 when creating post for non-existing blog', async () => {
        const nonExistingId = '65f31a72c4d1caeef6f7b1a1';
        
        await request(app.getHttpServer())
          .post(`/blogs/${nonExistingId}/posts`)
          .send(VALID_POST_DATA)
          .expect(404);
      });

      it('should return 400 when creating post with invalid data', async () => {
        await request(app.getHttpServer())
          .post(`/blogs/${createdBlogId}/posts`)
          .send({
            title: '', // невалидный заголовок
            shortDescription: 'de', // слишком короткий
            content: 'short', // слишком короткий
          })
          .expect(400);
      });
    });
  });
});