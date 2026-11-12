import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto.js';
import { UpdateSettingDto } from './dto/update-setting.dto.js';

@Injectable()
export class SettingsService {
  findAll() {
    return {
      isLocationEnabled: false,
      savedLongitude: 0,
      savedLatitude: 0,
      isAIenabled: true,
      language: 'EN',
      radius: 5,
      isNotificationEnabled: true,
    };
  }
}
