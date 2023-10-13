export default function map(product, locale) {
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
  mappedProduct.name = product.name[locale];

  mappedProduct.categories = categories;
  mappedProduct.variants = variants;
  return mappedProduct;
}

function transformAttribute(attribute, locale) {
  if (attribute.name && attribute.value[locale])
    return {
      [attribute.name]: attribute.value[locale],
    };
}

function transformAttributes(attributes, locale) {
  return attributes
    .map((attribute) => transformAttribute(attribute, locale))
    .filter((attribute) => attribute !== undefined);
}

function transformPrices(prices) {
  let transformedPrices = {};

  prices.forEach((price) => {
    if (price) {
      transformedPrices[price.value.currencyCode] = {
        centAmount: price.value.centAmount,
        fractionDigits: price.value.fractionDigits,
      };
    }
  });

  if (JSON.stringify(transformedPrices) === '{}') {
    return undefined;
  }
  return transformedPrices;
}

function transformVariant(variant) {
  let images = variant.images.map((image) => image.url);
  let attributes = transformAttributes(variant.attributes);
  let prices;
  let discountedPrices;
  if (variant.prices) {
    prices = transformPrices(variant.prices);

    discountedPrices = variant?.prices.map((price) => price.discounted);
    if (discountedPrices) {
      discountedPrices = transformPrices(discountedPrices);
    }
  }

  let result = {
    id: variant.id,
    sku: variant.sku,
    images,
    attributes,
    prices: !prices ? undefined : prices,
    discountedPrices: !discountedPrices ? undefined : discountedPrices,
    isOnStock: variant.availability?.isOnStock,
    availableQuantity: variant.availability?.availableQuantity,
    version: variant.availability?.version,
  };
  result = JSON.parse(JSON.stringify(result));
  return result;
}
