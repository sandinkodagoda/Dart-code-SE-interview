import { OrderStatus } from '@prisma/client';
import {
  isValidOrderTransition,
  getAllowedNextStatuses,
  isTerminalOrderStatus,
} from './order-status.transitions';

describe('OrderStatus Transitions (Order State Machine)', () => {
  describe('Valid forward transitions', () => {
    it('allows PENDING -> CONFIRMED and PENDING -> CANCELLED', () => {
      expect(isValidOrderTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
      expect(isValidOrderTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
    });

    it('allows CONFIRMED -> PROCESSING and CONFIRMED -> CANCELLED', () => {
      expect(isValidOrderTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).toBe(true);
      expect(isValidOrderTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).toBe(true);
    });

    it('allows PROCESSING -> READY_TO_SHIP and PROCESSING -> CANCELLED', () => {
      expect(isValidOrderTransition(OrderStatus.PROCESSING, OrderStatus.READY_TO_SHIP)).toBe(true);
      expect(isValidOrderTransition(OrderStatus.PROCESSING, OrderStatus.CANCELLED)).toBe(true);
    });

    it('allows READY_TO_SHIP -> SHIPPED and READY_TO_SHIP -> CANCELLED', () => {
      expect(isValidOrderTransition(OrderStatus.READY_TO_SHIP, OrderStatus.SHIPPED)).toBe(true);
      expect(isValidOrderTransition(OrderStatus.READY_TO_SHIP, OrderStatus.CANCELLED)).toBe(true);
    });

    it('allows SHIPPED -> DELIVERED', () => {
      expect(isValidOrderTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true);
    });
  });

  describe('Invalid or forbidden transitions', () => {
    it('rejects jumping from PENDING directly to SHIPPED or DELIVERED', () => {
      expect(isValidOrderTransition(OrderStatus.PENDING, OrderStatus.SHIPPED)).toBe(false);
      expect(isValidOrderTransition(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false);
    });

    it('rejects transitioning backwards from DELIVERED or CANCELLED', () => {
      expect(isValidOrderTransition(OrderStatus.DELIVERED, OrderStatus.PENDING)).toBe(false);
      expect(isValidOrderTransition(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(false);
      expect(isValidOrderTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(false);
    });

    it('rejects cancelling an already SHIPPED or DELIVERED order', () => {
      expect(isValidOrderTransition(OrderStatus.SHIPPED, OrderStatus.CANCELLED)).toBe(false);
      expect(isValidOrderTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
    });

    it('rejects transitioning to identical status', () => {
      expect(isValidOrderTransition(OrderStatus.PENDING, OrderStatus.PENDING)).toBe(false);
      expect(isValidOrderTransition(OrderStatus.CONFIRMED, OrderStatus.CONFIRMED)).toBe(false);
    });
  });

  describe('Terminal state checks', () => {
    it('identifies DELIVERED and CANCELLED as terminal states', () => {
      expect(isTerminalOrderStatus(OrderStatus.DELIVERED)).toBe(true);
      expect(isTerminalOrderStatus(OrderStatus.CANCELLED)).toBe(true);
      expect(isTerminalOrderStatus(OrderStatus.PENDING)).toBe(false);
      expect(isTerminalOrderStatus(OrderStatus.SHIPPED)).toBe(false);
    });

    it('returns empty next allowed statuses for terminal states', () => {
      expect(getAllowedNextStatuses(OrderStatus.DELIVERED)).toEqual([]);
      expect(getAllowedNextStatuses(OrderStatus.CANCELLED)).toEqual([]);
    });
  });
});
