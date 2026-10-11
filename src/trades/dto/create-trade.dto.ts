import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TradeInstrument, InstrumentType, TradeSide, TradeEmotion, OptionType } from '@prisma/client';

export class CreateTradeDto {
  @IsEnum(TradeInstrument)
  instrument!: TradeInstrument;

  @IsEnum(InstrumentType)
  instrumentType!: InstrumentType;

  @IsEnum(TradeSide)
  side!: TradeSide;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  entryPrice!: number;

  @IsOptional()
  @IsNumber()
  stopLoss?: number;

  @IsOptional()
  @IsNumber()
  target?: number;

  @IsOptional()
  @IsString()
  thesis?: string;

  @IsOptional()
  @IsEnum(TradeEmotion)
  emotion?: TradeEmotion;

  @IsOptional()
  @IsEnum(OptionType)
  optionType?: OptionType;

  @IsOptional()
  @IsNumber()
  strike?: number;

  @IsOptional()
  @IsString()
  expiry?: string;
}
