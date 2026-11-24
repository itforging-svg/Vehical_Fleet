import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs, FunctionReference } from "convex/server";
import { getSessionToken } from "../authSession";

type PublicFunctionReference = FunctionReference<any, "public", any, any>;
type AdminArgs<T extends PublicFunctionReference> = Omit<FunctionArgs<T>, "sessionToken">;

export function useAdminQuery<T extends FunctionReference<"query", "public", any, any>>(
    reference: T,
    args: AdminArgs<T> | "skip",
) {
    const token = getSessionToken();
    const authenticatedArgs = args === "skip" || !token
        ? "skip"
        : { ...args, sessionToken: token };
    return useQuery(reference, authenticatedArgs as FunctionArgs<T> | "skip");
}

export function useAdminMutation<T extends FunctionReference<"mutation", "public", any, any>>(
    reference: T,
) {
    const mutation = useMutation(reference);
    return useCallback((args: AdminArgs<T>) => {
        const token = getSessionToken();
        if (!token) throw new Error("Your session has expired. Please sign in again.");
        return mutation({ ...args, sessionToken: token } as FunctionArgs<T>);
    }, [mutation]);
}
