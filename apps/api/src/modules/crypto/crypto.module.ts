import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service.js';
import { Global } from '@nestjs/common';

@Global()
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule { }
