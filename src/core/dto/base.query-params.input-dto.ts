//базовый класс для query параметров с пагинацией

import { Type } from 'class-transformer';
import { IsOptional, IsEnum } from 'class-validator';

//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
  //для трансформации в number
  @Type(() => Number)
  pageNumber: number = 1;
  @Type(() => Number)
  pageSize: number = 10;
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDirection: 'asc' | 'desc' = 'desc';

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
