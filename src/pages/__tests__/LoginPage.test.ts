import { beforeEach, describe, expect, it, type Mocked } from 'vitest'
import { vi } from 'vitest'
import { AuthenticationService } from '@/services/AuthenticationService'

describe('RegistrationForm.vue', () => {
  beforeEach(async () => {
    /**
     * create the existing service and a mock that will replace the existing service
     * by default we will use the existing service methods but can stub them out in the tests
     *
     * example on how to change it later:
     * mockService.Login = vi.fn(async (email: string, password: string): Promise<ApiResult> => {
     *  return new ApiResult(200)
     * })
     */
    const actualService = new AuthenticationService()
    const mockService = {
      Login: vi.fn(actualService.login)
    }
  })

  it('should pass TEST', () => {
    expect(true).toBe(true)
  })
})
