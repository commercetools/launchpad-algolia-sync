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
  mappedProduct.name = product.name['en-US'];

  mappedProduct.categories = categories;
  mappedProduct.variants = variants;
  return mappedProduct;
}

function transformAttribute(attribute) {
  if (attribute.name && attribute.value['en-US'])
    return {
      [attribute.name]: attribute.value['en-US'],
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
  let price;
  let discounted;
  if (variant.prices) {
    price = variant?.prices.filter(
      (price) => price?.value.currencyCode === 'USD'
    )[0];
    discounted = variant?.prices.filter((price) => {
      if (price?.discounted)
        return price?.discounted?.value.currencyCode === 'USD';
      return false;
    })[0];
  }

  let result = {
    id: variant.id,
    sku: variant.sku,
    images,
    attributes,
    price: !price ? undefined : price.value,
    discountedPrice: !discounted ? undefined : discounted.value,
    isOnStock: variant.availability?.isOnStock,
    availableQuantity: variant.availability?.availableQuantity,
    version: variant.availability?.version,
  };
  result = JSON.parse(JSON.stringify(result));
  return result;
}
