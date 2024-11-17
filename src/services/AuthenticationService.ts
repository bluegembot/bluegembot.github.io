import { ApiResult } from '@/responses/ApiResponse'
const env = import.meta.env

export class AuthenticationService {
  public baseUrl: string = env.VITE_BACKEND_URL!

  /**
   * Sends a login request to the server
   *
   * @param email email of the user
   * @param password password of the user
   * @returns Promise<ApiResult> the result of the login request if something went wrong returns a 500
   */
  public async login(email: string, password: string): Promise<ApiResult> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      return new ApiResult(response.status)
    } catch {
      return new ApiResult(500)
    }
  }
}
