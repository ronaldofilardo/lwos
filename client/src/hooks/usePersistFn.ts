import { useRef } from "react";

// `never[]` aceita qualquer assinatura de função sob variância contravariante
// (diferente de `unknown[]`, que rejeitaria callbacks com parâmetros tipados).
type PersistableFunction = (...args: never[]) => unknown;

/**
 * usePersistFn instead of useCallback to reduce cognitive load
 */
export function usePersistFn<T extends PersistableFunction>(fn: T) {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args: Parameters<T>) {
      return fnRef.current!.apply(this, args);
    } as T;
  }

  return persistFn.current!;
}
