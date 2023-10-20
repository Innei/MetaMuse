import { isIPv4, isIPv6 } from 'node:net'

import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { CacheService } from '@core/processors/cache/cache.service'
import { Inject, Injectable } from '@nestjs/common'

import { HttpService } from './helper.http.service'

const TIMEOUT = 5000

@Injectable()
export class IpService {
  @Inject()
  private readonly httpService: HttpService

  @Inject()
  private readonly cacheService: CacheService

  async fetchIpInfo(ip: string) {
    const isV4 = isIPv4(ip)
    const isV6 = isIPv6(ip)

    if (!isV4 && !isV6) {
      throw new BizException(ErrorCodeEnum.Custom, 'ip is not valid')
    }
    const queryKey = ['ip', `${ip}`]
    return this.cacheService.cacheGet({
      key: queryKey,
      getValueFun: () => {
        return this.httpService.queryClient.fetchQuery({
          queryKey,
          queryFn: async () => {
            const axios = this.httpService.axiosRef
            const timeout = TIMEOUT

            if (isV4) {
              const data = (await axios.get(
                `https://ipv4.ip.mir6.com/api_json.php?ip=${ip}&token=mir6.com`,
                {
                  timeout,
                },
              )) as IPResponseData

              const { city, country, districts, isp, province, net } = data.data
              return {
                cityName: districts,
                countryName: country + province,
                regionName: city,
                ip,
                ispDomain: isp,
                ownerDomain: isp || net,
              }
            } else {
              const { data } = (await axios.get(
                `http://ip-api.com/json/${ip}`,
                {
                  timeout,
                },
              )) as any

              const res = {
                cityName: data.city,
                countryName: data.country,
                ip: data.query,
                ispDomain: data.as,
                ownerDomain: data.org,
                regionName: data.region_name,
              } as const

              return res
            }
          },
        })
      },
      expireTime: 60 * 60 * 24,
    })
  }
}

interface IPResponseData {
  code: number
  success: boolean
  message: string
  data: Data
  location: string
  myip: string
  time: string
}
interface Data {
  ip: string
  dec: string
  country: string
  countryCode: string
  province: string
  city: string
  districts: string
  idc: string
  isp: string
  net: string
  protocol: string
  begin: string
  end: string
}
