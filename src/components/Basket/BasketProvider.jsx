import React, {useState} from 'react';
import BasketContext from './BasketContext.jsx';
import {createNewOrder, fetchAnswerWebQuery} from '../../services.js';
import {webApp} from '../../telegram.js';

const BasketProvider = ({children, ...rest}) => {
  const [order, setOrder] = useState(null);
  const [basket, setBasket] = useState(null);
  const [currency,] = useState('LKR');

  const handleProductAdd = (product) => {
    const products = basket ? [...basket.products] : [];
    const isProductExist = products.filter(x => x.id === product.id)[0];

    if (isProductExist) {
      ++isProductExist.count;
    } else {
      products.push({
        ...product,
        count: 1,
      });
    }

    setBasket({products});
  };

  const handleProductDelete = (product) => {
    const products = basket.products.filter(p => {
      if (p.id === product.id) {
        if (p.count <= 1) return false;
        --p.count;
      }

      return p;
    });

    setBasket({products});
  };

  const handleMakeOrder = async (data) => {
    const {products} = basket;

    const order = await createNewOrder({
      products,
      shopId: products[0].shopId,
      telegramGroupId: products[0].shop.telegramGroupId,
      created: new Date(),
      status: 'pending',
      ...data
    });

    if (webApp) {
      await fetchAnswerWebQuery(`\#${order.id}`);
    }

    setOrder(order);
    setBasket(null);
  };

  const getTimeForCook = () => {
    if (!basket) return null;

    const timesCount = basket.products.length + 1;
    const timesSum = basket.products.reduce((acc, product) => acc + parseInt(product.time), 0);
    const timesAvg = timesSum / timesCount;

    return timesAvg + timesSum * ((timesCount - 1) * 0.1);
  };

  const getCount = () => {
    if (!basket) return null;
    return basket.products.reduce((acc, product) => acc + parseInt(product.count), 0);
  };

  const getSum = () => {
    if (!basket) return 0;
    return basket.products.reduce((acc, product) => acc + parseInt(product.count) * parseInt(product.price), 0);
  };

  return (
    <BasketContext.Provider {...rest} value={{
      basket,
      currency,
      order,
      count: getCount(),
      price: getSum(),
      timeForCook: getTimeForCook(),
      addProduct: handleProductAdd,
      deleteProduct: handleProductDelete,
      makeOrder: handleMakeOrder,
    }}>
      {children}
    </BasketContext.Provider>
  );
};

export default BasketProvider;