import { prisma } from './prisma';

export async function deleteProductCascade(productId: number) {
  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { product_id: productId } });
    await tx.orderItem.deleteMany({ where: { product_id: productId } });
    await tx.cartItem.deleteMany({ where: { product_id: productId } });
    await tx.product.delete({ where: { product_id: productId } });
  });
}
