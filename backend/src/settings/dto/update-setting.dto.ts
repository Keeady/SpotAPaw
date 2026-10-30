import { PartialType } from '@nestjs/mapped-types';
import { CreateSettingDto } from './create-setting.dto.js';

export class UpdateSettingDto extends PartialType(CreateSettingDto) {}
