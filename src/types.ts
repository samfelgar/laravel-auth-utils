import type { AxiosInstance } from 'axios'

export interface AuthenticateCommand {
  email: string
  password: string
  api: AxiosInstance
  apiLoginRoute: string
}
