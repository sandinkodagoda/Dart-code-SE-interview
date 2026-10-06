import * as crypto from 'crypto';

describe('PayHere Sandbox Cryptographic Verification', () => {
  const merchantId = '1211111';
  const merchantSecret = '4MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM';
  const orderNumber = 'TECH-2026-000001';
  const amount = '595000.00';
  const currency = 'LKR';
  const statusCode = '2'; // SUCCESS

  function computeSecretHash(secret: string): string {
    return crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
  }

  function generateInitiationHash(
    mId: string,
    orderNo: string,
    amt: string,
    curr: string,
    mSecret: string,
  ): string {
    const sHash = computeSecretHash(mSecret);
    return crypto
      .createHash('md5')
      .update(`${mId}${orderNo}${amt}${curr}${sHash}`)
      .digest('hex')
      .toUpperCase();
  }

  function generateNotificationSig(
    mId: string,
    orderNo: string,
    amt: string,
    curr: string,
    status: string,
    mSecret: string,
  ): string {
    const sHash = computeSecretHash(mSecret);
    return crypto
      .createHash('md5')
      .update(`${mId}${orderNo}${amt}${curr}${status}${sHash}`)
      .digest('hex')
      .toUpperCase();
  }

  it('correctly generates MD5 secret hash', () => {
    const secretHash = computeSecretHash(merchantSecret);
    expect(secretHash).toMatch(/^[A-F0-9]{32}$/);
    expect(secretHash.length).toBe(32);
  });

  it('generates consistent 32-character uppercase MD5 initiation hash', () => {
    const hash = generateInitiationHash(merchantId, orderNumber, amount, currency, merchantSecret);
    expect(hash).toMatch(/^[A-F0-9]{32}$/);

    // Idempotent
    const hash2 = generateInitiationHash(merchantId, orderNumber, amount, currency, merchantSecret);
    expect(hash).toBe(hash2);
  });

  it('verifies valid notification md5sig successfully', () => {
    const validSig = generateNotificationSig(
      merchantId,
      orderNumber,
      amount,
      currency,
      statusCode,
      merchantSecret,
    );

    // Verify
    const sHash = computeSecretHash(merchantSecret);
    const expected = crypto
      .createHash('md5')
      .update(`${merchantId}${orderNumber}${amount}${currency}${statusCode}${sHash}`)
      .digest('hex')
      .toUpperCase();

    expect(validSig).toBe(expected);
  });

  it('rejects tampered amount or status code', () => {
    const validSig = generateNotificationSig(
      merchantId,
      orderNumber,
      amount,
      currency,
      statusCode,
      merchantSecret,
    );

    // Tampered amount (e.g. attacker changes 595000.00 to 1.00)
    const tamperedAmountSig = generateNotificationSig(
      merchantId,
      orderNumber,
      '1.00',
      currency,
      statusCode,
      merchantSecret,
    );

    expect(validSig).not.toBe(tamperedAmountSig);

    // Tampered status code
    const tamperedStatusSig = generateNotificationSig(
      merchantId,
      orderNumber,
      amount,
      currency,
      '-2',
      merchantSecret,
    );

    expect(validSig).not.toBe(tamperedStatusSig);
  });

  it('rejects tampered merchant secret', () => {
    const wrongSecretSig = generateNotificationSig(
      merchantId,
      orderNumber,
      amount,
      currency,
      statusCode,
      'invalid-secret-key',
    );

    const validSig = generateNotificationSig(
      merchantId,
      orderNumber,
      amount,
      currency,
      statusCode,
      merchantSecret,
    );

    expect(validSig).not.toBe(wrongSecretSig);
  });
});
