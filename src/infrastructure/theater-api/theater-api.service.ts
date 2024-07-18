import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ErrorResult, Result } from '../../common/exceptions/result';
import { LoginInfo } from '../../config/login-info';
import { PriceDto } from './dto/price.dto';
import { SeatDto } from './dto/seat.dto';
import { SectionDto } from './dto/section.dto';
import { TheaterLayoutDto } from './dto/theater-layout.dto';

@Injectable()
export class TheaterApiService {
  static REQUEST_ID = 1;

  private readonly _loginInfo: LoginInfo;
  private readonly _httpClient: any;

  constructor(configService: ConfigService) {
    this._loginInfo = configService.get<LoginInfo>('theaterApi.loginInfo')!;

    const domain = configService.get<string>('theaterApi.domain')!;
    const timeout = configService.get<number>('theaterApi.timeout')!;

    this._httpClient = axios.create({
      baseURL: `https://${domain}/tessitura/ctglive`,
      timeout,
    });
  }

  async getPricesPerZone(eventId: number): Promise<Result<PriceDto[]>> {
    const queryBlobParams = {
      SessionKey: this._loginInfo.sessionKey,
      iPerf_no: eventId,
      iModeOfSale: this._loginInfo.modeOfSale,
    };

    try {
      const response = await this._httpClient.get('', {
        params: {
          id: TheaterApiService.REQUEST_ID,
          method: 'GetPerformanceDetailWithDiscountingEx',
          params: this._toBase64String(queryBlobParams),
        },
      });

      return this._retrievePrices(response.data);
    } catch (err) {
      const errorResult: ErrorResult = this._resolveRequestError(err);
      return Result.fromFailure(errorResult);
    }
  }

  async getTheaterLayout(eventId: number): Promise<Result<TheaterLayoutDto>> {
    const queryBlobParams = {
      sSessionKey: this._loginInfo.sessionKey,
      iModeOfSale: this._loginInfo.modeOfSale,
      iSourceNumber: this._loginInfo.sourceNumber,
      iPerformanceNumber: eventId,
      iPackageNumber: 0,
      cSummaryOnly: 'N',
      cCalcPackageAlloc: 'Y',
      cReturnNonSeats: 'Y',
    };

    try {
      const response = await this._httpClient.get('', {
        params: {
          id: TheaterApiService.REQUEST_ID,
          method: 'GetSeatsBriefWithMOS',
          params: this._toBase64String(queryBlobParams),
        },
      });

      return this._retrieveTheaterLayout(response.data);
    } catch (err) {
      const errorResult: ErrorResult = this._resolveRequestError(err);
      return Result.fromFailure(errorResult);
    }
  }

  private _retrievePrices(responseBody: any): Result<PriceDto[]> {
    if (responseBody.error) {
      return Result.failure(`Error from external API host: ${responseBody.error}`, 502);
    }

    const prices: PriceDto[] =
      responseBody.result.GetPerformanceDetailWithDiscountingExResult.Price.map(
        (p: { zone_no: string; price: string }) => ({
          zoneId: p.zone_no,
          price: Number(p.price),
        }),
      );

    return Result.success(prices);
  }

  private _retrieveTheaterLayout(responseBody: any): Result<TheaterLayoutDto> {
    if (responseBody.error) {
      return Result.failure(`Error from external API host: ${responseBody.error}`, 502);
    }

    const seats: SeatDto[] = responseBody.result.GetSeatsBriefExResults.S.filter(
      (seatWrapper: { D: string }) => !seatWrapper.D.startsWith('0'),
    )
      .map((seatWrapper: { D: string }) => seatWrapper.D.split(','))
      .map((fields: string[]) => ({
        id: fields[4],
        statusCode: fields[3],
        zoneId: fields[5],
        rowNumber: fields[1],
        seatNumber: fields[2],
        sectionId: fields[0],
      }));

    const sections: SectionDto[] = responseBody.result.GetSeatsBriefExResults.Section.map(
      (section: { section: string; section_desc: string }) => ({
        id: section.section,
        description: section.section_desc,
      }),
    );

    const layout: TheaterLayoutDto = { seats, sections };

    return Result.success(layout);
  }

  private _resolveRequestError(error: any): ErrorResult {
    if (error.response) {
      return {
        message: `Got bad response from external API with status: "${error.response.status}"`,
        code: 502,
      };
    }
    if (error.request) {
      return {
        message: 'Failed to get the response from the external API',
        code: 504,
      };
    }
    return {
      message: 'Something bad happend while setting up the request to API',
      code: 500,
    };
  }

  private _toBase64String(obj: any): string {
    const jsonStr = JSON.stringify(obj);
    return Buffer.from(jsonStr).toString('base64');
  }
}
