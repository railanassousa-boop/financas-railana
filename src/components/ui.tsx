import type { PropsWithChildren } from 'react'
import type React from 'react'
import clsx from 'clsx'

export const Card = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <section className={clsx('rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
    {children}
  </section>
)

export const Button = ({
  children,
  className,
  ...props
}: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
  <button
    className={clsx(
      'rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring dark:border-slate-700 dark:bg-slate-950"
    {...props}
  />
)

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring dark:border-slate-700 dark:bg-slate-950"
    {...props}
  />
)
