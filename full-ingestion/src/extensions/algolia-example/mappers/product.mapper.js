export default function map(product) {
  let mappedProduct = {};
  let categories = product.categories.map((category) => {
    return {
      id: category.id,
    };
  });
  let variants = [];
  if (product.masterVariant)
    variants.push(transformVariant(product.masterVariant));

  if (product.variants.length > 0) {
    variants.push(product.variants.map((variant) => transformVariant(variant)));
    variants = variants.flatMap((variant) => variant);
  }
  mappedProduct.objectID = product.id;
  mappedProduct.productId = product.id;
  mappedProduct.name = product.name['en-GB'];

  mappedProduct.categories = categories;
  mappedProduct.variants = variants;
  return mappedProduct;
}

function transformAttribute(attribute) {
  if (attribute.name && attribute.value['en-GB'])
    return {
      [attribute.name]: attribute.value['en-GB'],
    };
}

function transformAttributes(attributes) {
  return attributes
    .map((attribute) => transformAttribute(attribute))
    .filter((attribute) => attribute !== undefined);
}

function transformVariant(variant) {
  let images = variant.images.map((image) => image.url);
  let attributes = transformAttributes(variant.attributes);
  return {
    id: variant.id,
    sku: variant.sku,
    images,
    attributes,
    isOnStock: variant.availability?.isOnStock,
    availableQuantity: variant.availability?.availableQuantity,
    version: variant.availability?.version,
  };
}
