import type { TempMailProvider } from '../types'
import { OneSecMailProvider } from './oneSecMail'
import { MailTmProvider } from './mailTm'
import { MailGwProvider } from './mailGw'
import { GuerrillaMailProvider } from './guerrillaMail'

export const providers: TempMailProvider[] = [
  new MailTmProvider(),
  new OneSecMailProvider(),
  new MailGwProvider(),
  new GuerrillaMailProvider(),
]

export function getProviderById(id: string): TempMailProvider | undefined {
  return providers.find((p) => p.id === id)
}

export function getDefaultProvider(): TempMailProvider {
  return providers[0]
}
