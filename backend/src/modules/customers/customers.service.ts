import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find or create a guest customer by email.
   * For guest checkout we identify customers by email address.
   * If the same email places multiple orders the same Customer record is reused.
   */
  async findOrCreate(data: {
    name: string;
    email: string;
    phone: string;
  }) {
    const email = data.email.toLowerCase().trim();

    // Try to find existing customer by email
    let customer = await this.prisma.customer.findFirst({
      where: { email },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          name: data.name.trim(),
          email,
          phone: data.phone.trim(),
        },
      });
      this.logger.log(`New guest customer created: ${email}`);
    } else {
      // Update name and phone with latest provided values
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.name.trim(),
          phone: data.phone.trim(),
        },
      });
    }

    return customer;
  }
}
