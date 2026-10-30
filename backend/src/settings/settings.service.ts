import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto.js';
import { UpdateSettingDto } from './dto/update-setting.dto.js';

@Injectable()
export class SettingsService {
  create(createSettingDto: CreateSettingDto) {
    return 'This action adds a new setting';
  }

  findAll() {
    return {};
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return `This action updates a #${id} setting`;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
