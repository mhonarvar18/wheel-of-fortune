// این فایل فقط تایپ است و در بیلد خروجی ندارد
import 'express';

declare global {
  namespace Express {
    // چیزی که JwtStrategy در req.user می‌گذارد
    interface User {
      userId: string; // برمی‌گردانیم در validate()
      mobile: string;
      // اگر جایی مستقیماً payload را گذاشتی:
      sub?: string;
    }
  }
}
