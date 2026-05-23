'use client'

import { useActionState } from 'react'
import { updateProduct } from '@/app/actions/products'
import ProductForm from '@/app/ui/product-form'

type DefaultValues = {
  name?: string
  sku?: string
  description?: string
  price?: number
  stock?: number
  minStock?: number
  category?: string
  imageUrl?: string
}

export default function EditProductClient({ id, defaultValues }: { id: string; defaultValues: DefaultValues }) {
  const boundAction = updateProduct.bind(null, id)
  const [state, action, pending] = useActionState(boundAction, undefined)

  return (
    <ProductForm
      action={action}
      defaultValues={defaultValues}
      isEdit
      state={state as { errors?: Record<string, string[]>; message?: string } | undefined}
      pending={pending}
    />
  )
}
