import { faker } from '@faker-js/faker';

export function generarProducto() {
    return {
        name: faker.commerce.product() ,
        price: faker.commerce.price(),
        thumbnail: faker.image.imageUrl(500, 500, 'commerce')
    }
}