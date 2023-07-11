import { LoginResponse, LogoutResponse, UserResponse } from '../models/User'
import { Get, Security, Route, Post, Body, Controller, Tags, Example, Request } from 'tsoa'
import { User } from '../entities/User'
import { LoginRequest, ExpressRequest } from './requests'
import { ErrorResponse } from './responses'
import { getRepository } from 'typeorm'
import { UserCache } from '../cache/UserCache'

@Route()
export class RootController extends Controller {
  /**
   * Log in and retrieve token for authenticating requests
   */
  @Tags('Authentication')
  @Post('login')
  @Example<LoginResponse>({
    message: 'success',
    data: {
      id: 'abc123',
      email: 'alex@example.com',
      created: new Date('2011-10-05T14:48:00.000Z'),
      updated: new Date('2011-10-05T14:48:00.000Z'),
    },
    token: '1234abcd',
  })
  public async login(
    @Body() requestBody: LoginRequest,
    @Request() request: ExpressRequest,
  ): Promise<LoginResponse | ErrorResponse> {
    const { email, password } = requestBody
    const user: User = await UserCache.getByEmail(email)

    if (!user) {
      this.setStatus(403)
      return { message: '' }
    }

    if (!password || !user.checkPassword(password)) {
      this.setStatus(403)
      return { message: '' }
    }

    const token = user.generateJWT()

    this.setHeader('Set-Cookie', `jwt=${token}; Max-Age=3600; Path=/; HttpOnly`)

    // populate user cache

    return {
      data: await user.toResponseModel(),
      token: token,
    }
  }

  /**
   * Retrieve currently logged in user
   */
    @Security('jwtRequired')
    @Get('login')
    @Example<UserResponse>({
      message: 'success',
      data: {
        id: 'abc123',
        email: 'alex@example.com',
        created: new Date('2011-10-05T14:48:00.000Z'),
        updated: new Date('2011-10-05T14:48:00.000Z'),
      },
    })
    public async loginPing(@Request() request: ExpressRequest): Promise<UserResponse | ErrorResponse> {
      try {
        const token = request.user.generateJWT()

        this.setHeader('Set-Cookie', `jwt=${token}; Max-Age=3600; Path=/; HttpOnly`)

        // populate user cache

        return {
          data: await request.user.toResponseModel(),
          message: 'success',
        }
      } catch (err) {
        return {
          message: 'failed',
        }
      }
    }

  /**
   * Retrieve currently logged in user
   */
  @Security('jwtRequired')
  @Post('ping')
  @Example<UserResponse>({
    message: 'success',
    data: {
      id: 'abc123',
      email: 'alex@example.com',
      created: new Date('2011-10-05T14:48:00.000Z'),
      updated: new Date('2011-10-05T14:48:00.000Z'),
    },
  })
  public async ping(@Request() request: ExpressRequest): Promise<UserResponse | ErrorResponse> {
    try {
      const token = request.user.generateJWT()

      this.setHeader('Set-Cookie', `jwt=${token}; Max-Age=3600; Path=/; HttpOnly`)

      return {
        data: await request.user.toResponseModel(),
        message: 'success',
      }
    } catch (err) {
      return {
        message: 'failed',
      }
    }
  }

  /**
   * Logout and clear existing JWT
   */
  @Tags('Authentication')
  @Get('logout')
  @Example<LogoutResponse>({
    message: 'success',
  })
  public async logout(@Request() request: ExpressRequest): Promise<LogoutResponse> {
    this.setHeader('Set-Cookie', `jwt=0; Max-Age=3600; Path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:01 GMT`)

    return { message: '' }
  }

  /**
   * Retrieve currently logged in user
   */
  @Security('jwtRequired')
  @Get('me')
  @Example<UserResponse>({
    message: 'success',
    data: {
      id: 'abc123',
      email: 'alex@example.com',
      created: new Date('2011-10-05T14:48:00.000Z'),
      updated: new Date('2011-10-05T14:48:00.000Z'),
    },
  })
  public async getMe(@Request() request: ExpressRequest): Promise<UserResponse | ErrorResponse> {
    try {
      const user: User = await UserCache.getByEmail(request.user.email)

      return {
        data: await user.toResponseModel(),
        message: 'success',
      }
    } catch (err) {
      return {
        message: 'failed',
      }
    }
  }
}
