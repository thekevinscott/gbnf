import { describe, test, expect } from "vitest";
import { GraphPointer, isGraphPointerRuleChar, isGraphPointerRuleCharExclude, isGraphPointerRuleEnd, isGraphPointerRuleRef } from "./graph-pointer";
import { RuleRef } from "./rule-ref.js";
import { GraphNode } from "./graph-node";
import { RuleType } from "./types";

describe('graph-pointer', () => {
  describe('type guards', () => {
    describe('isGraphPointerRuleRef', () => {
      test('it returns true', async () => {
        const node = new GraphNode(new RuleRef(1), { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleRef(pointer)).toEqual(true);
      });

      test('it returns false', async () => {
        const node = new GraphNode({ type: RuleType.END }, { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleRef(pointer)).toEqual(false);
      });
    });

    describe('isGraphPointerRuleEnd', () => {
      test('it returns false', async () => {
        const node = new GraphNode(new RuleRef(1), { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleEnd(pointer)).toEqual(false);
      });

      test('it returns true', async () => {
        const node = new GraphNode({ type: RuleType.END }, { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleEnd(pointer)).toEqual(true);
      });
    });

    describe('isGraphPointerRuleChar', () => {
      test('it returns true', async () => {
        const node = new GraphNode({ type: RuleType.CHAR, value: [97] }, { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleChar(pointer)).toEqual(true);
      });

      test('it returns false', async () => {
        const node = new GraphNode({ type: RuleType.END }, { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleChar(pointer)).toEqual(false);
      });
    });

    describe('isGraphPointerRuleCharExclude', () => {
      test('it returns true', async () => {
        const node = new GraphNode({ type: RuleType.CHAR_EXCLUDE, value: [97] }, { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleCharExclude(pointer)).toEqual(true);
      });

      test('it returns false', async () => {
        const node = new GraphNode({ type: RuleType.CHAR, value: [97] }, { stackId: 1, pathId: 2, stepId: 3 });
        const pointer = new GraphPointer(node);
        expect(isGraphPointerRuleCharExclude(pointer)).toEqual(false);
      });
    });
  });
});
