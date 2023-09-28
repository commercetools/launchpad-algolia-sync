export default function map(product) {
  let mappedProduct = {};
  let categories = product.categories.map((category) => {
    return {
      key: category.obj.key,
      name: category.obj.name,
      slug: category.obj.slug,
    };
  });

  mappedProduct.objectID = product.id;
  mappedProduct.productType = product.productType.obj;
  mappedProduct.taxCategory = product.taxCategory.obj;
  mappedProduct.masterData = {
    current: {
      categories,
      name: product.name,
      slug: product.slug,
      metaTitle: product.metaTitle,
    },
  };
  return mappedProduct;
}
