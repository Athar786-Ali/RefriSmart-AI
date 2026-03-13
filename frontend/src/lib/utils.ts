export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const formatInr = (amount: number | string) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
