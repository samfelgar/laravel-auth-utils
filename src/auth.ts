import { isAxiosError, type AxiosInstance } from 'axios'
import { isPast, toDate } from 'date-fns'
import type { Router } from 'vue-router'
import type { AuthenticateCommand } from './types.js'
import { Login, type LoginResponse } from './login/login.js'

const tokenKey = 'token'
const expiresAtKey = 'expiresAt'

export async function authenticate(command: AuthenticateCommand) {
  const service = new Login(command.api, command.apiLoginRoute)

  const result = await service.login(command.email, command.password)
  storeToken(result)
  configureAxiosHeaders(command.api, result.token)
}

export function configureAxiosHeaders(api: AxiosInstance, token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function configureAxiosInterceptors(api: AxiosInstance, loginRoute: string): void {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        logout(api)
        window.location.assign(loginRoute)
      }
      return Promise.reject(error)
    },
  )
}

export function axiosHasAuthorizationHeader(api: AxiosInstance): boolean {
  return api.defaults.headers.common.Authorization !== undefined
}

export function configureRouterMiddleware(router: Router, loginRouteName: string): void {
  router.beforeEach((to) => {
    if (!isAuthenticated() && to.name !== loginRouteName) {
      return { name: loginRouteName }
    }
  })
}

export function getToken(): string | null {
  const token = localStorage.getItem(tokenKey)
  if (token === null) {
    return null
  }

  const expiresAtString = localStorage.getItem(expiresAtKey)
  if (expiresAtString === null) {
    return null
  }

  const expiresAt = Number(expiresAtString)

  if (isPast(toDate(expiresAt))) {
    return null
  }

  return token
}

export function isAuthenticated(): boolean {
  const token = getToken()
  return token !== null
}

function storeToken(loginResponse: LoginResponse) {
  localStorage.setItem(tokenKey, loginResponse.token)
  localStorage.setItem(expiresAtKey, String(loginResponse.expires_at))
}

export function logout(axiosInstance: AxiosInstance): void {
  delete axiosInstance.defaults.headers.common.Authorization
  localStorage.removeItem(tokenKey)
  localStorage.removeItem(expiresAtKey)
}
