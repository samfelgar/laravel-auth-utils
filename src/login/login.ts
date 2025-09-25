import type { AxiosInstance } from 'axios'

export interface LoginResponse {
  token: string
  expires_at: number
}

export class Login {
  constructor(
    private readonly api: AxiosInstance,
    private readonly path: string,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>(this.path, {
      email,
      password,
    })

    return response.data
  }
}
