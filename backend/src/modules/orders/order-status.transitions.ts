import { OrderStatus } from '@prisma/client';

/**
 * Order Status Transition Map
 *
 * Defines allowed next states for each order status.
 * Invalid transitions are rejected at the service layer.
 *
 * Valid forward flow:
 *   PENDING → CONFIRMED → PROCESSING → READY_TO_SHIP → SHIPPED → DELIVERED
 *
 * Any state (except DELIVERED) can be CANCELLED.
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.PROCESSING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PROCESSING]: [
    OrderStatus.READY_TO_SHIP,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.READY_TO_SHIP]: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPED]: [
    OrderStatus.DELIVERED,
  ],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function isValidOrderTransition(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  const allowed = ALLOWED_ORDER_TRANSITIONS[current] ?? [];
  return allowed.includes(next);
}

export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_ORDER_TRANSITIONS[current] ?? [];
}

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return (ALLOWED_ORDER_TRANSITIONS[status] ?? []).length === 0;
}

