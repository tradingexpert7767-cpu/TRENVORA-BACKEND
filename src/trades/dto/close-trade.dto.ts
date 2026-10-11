import { IsNumber } from 'class-validator';

export class CloseTradeDto {
  @IsNumber()
  exitPrice!: number;
}
