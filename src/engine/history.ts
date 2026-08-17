/**
 * OPEN-CAP Mobile History & Undo/Redo Engine
 * Command Pattern implementation for memory-efficient mobile editing
 */

export interface ICommand {
  id: string;
  name: string; // Human-readable description (e.g., "Klip Böl", "Klip Taşı")
  timestamp: number;
  execute(): void;
  undo(): void;
  redo(): void;
}

export class HistoryManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private maxHistory: number;
  private listeners: Set<() => void> = new Set();

  constructor(maxHistory: number = 50) {
    this.maxHistory = maxHistory;
  }

  public execute(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    // Limit stack depth to prevent mobile memory bloat
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Clear redo stack on new action
    this.redoStack = [];
    this.notify();
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.notify();
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const command = this.redoStack.pop()!;
    command.redo();
    this.undoStack.push(command);
    this.notify();
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoStack(): ReadonlyArray<ICommand> {
    return this.undoStack;
  }

  public getRedoStack(): ReadonlyArray<ICommand> {
    return this.redoStack;
  }

  public getLastActionName(): string | null {
    if (this.undoStack.length === 0) return null;
    return this.undoStack[this.undoStack.length - 1].name;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

// Global Singleton for the mobile application
export const historyManager = new HistoryManager(1000);
