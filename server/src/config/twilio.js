import twilio from 'twilio'
import {env} from './env.js'


export const twilioClient = twilio(
    env.TWILIO_SID,
    env.TWILIO_AUTH_TOKEN
)