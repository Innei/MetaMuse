import { Transporter } from 'nodemailer'
import { Options } from 'nodemailer/lib/mailer'

import { EmailService } from '@core/processors/helper/services/helper.email.service'
import { defineProvider } from '@test/helper/defineProvider'

// @ts-expect-error
class MockEmailService implements EmailService {
  checkIsReady(): Promise<boolean> {
    return Promise.resolve(true)
  }

  async readTemplate(type: string): Promise<string> {
    return ''
  }
  public registerEmailType(
    type: string,
    exampleRenderProps: Record<string, any>,
  ): void {}

  async send(options: Options) {}
  async sendTestEmail() {}
  teardown(): void {}
  async writeTemplate(type: string, source: string): Promise<void> {}
  async deleteTemplate(type: string): Promise<void> {}

  public getExampleRenderProps(type: string) {}

  getInstance(): Transporter<unknown> {
    return {} as any
  }

  init(): void {}
  onModuleDestroy(): void {}
  async onModuleInit(): Promise<void> {}
}

export const mockedEmailService = new MockEmailService()

export const mockedEmailServiceProvider = defineProvider({
  provide: EmailService,
  useValue: mockedEmailService,
})
