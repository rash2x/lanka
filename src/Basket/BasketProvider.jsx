import React, {useEffect, useState} from 'react';
import {collection, doc, setDoc, query, where, getDocs, getDoc, onSnapshot} from 'firebase/firestore';
import {signInWithCustomToken} from 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth, firestore} from '../firebase.js';
import BasketContext from './BasketContext.jsx';

export const STATUS = {
  cooking: 'Cooking',
  cooked: 'Cooked',
  delivery: 'Delivering',
};

export const BASKET_STEP = {
  details: 'DETAILS',
  delivery: 'DELIVERY',
  login: 'LOGIN'
};

const BasketProvider = ({children, ...rest}) => {
  const [user,] = useAuthState(auth);
  const [order, setOrder] = useState(null);
  const [basket, setBasket] = useState(null);
  const [currency,] = useState('LKR');

  const [basketExpanded, setBasketExpanded] = useState(false);
  const [basketStep, setBasketStep] = useState(null);

  const handleCollapse = () => setBasketExpanded(false);
  const handleExpand = () => setBasketExpanded(true);

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

  const handleMakeOrder = async () => {
    const orderRef = doc(collection(firestore, 'basket'));
    const order = {
      products: basket.products,
      status: STATUS.cooking,
      date: new Date(),
    };

    await setDoc(orderRef, order);
    const orderSnap = await getDoc(orderRef);

    setOrder({
      ...order,
      id: orderSnap.id
    });

    setBasket(null);
    setBasketStep(BASKET_STEP.details);
    setBasketExpanded(false);

    window.open(`https://t.me/lankacafebot?start=${orderSnap.id}`);

    onSnapshot(orderRef, async (orderSnap) => {
      const data = orderSnap.data();

      if (!auth.currentUser && data.token) {
        await signInWithCustomToken(auth, data.token);
      }
    });
  };

  useEffect(() => {
    if (user) {
      const basket = collection(firestore, 'basket');
      const q = query(basket, where('user', '==', user.uid), where('status', '==', STATUS.cooking));

      getDocs(q).then(docs => {
        docs.forEach((doc) => {
          if (!order) setOrder({
            ...doc.data(),
            id: doc.id
          });
        });
      });
    }
  }, [user]);

  const count = basket && basket.products.reduce((acc, product) => acc + parseInt(product.count), 0);
  const price = basket && basket.products.reduce((acc, product) => acc + parseInt(product.count) * parseInt(product.price), 0);

  return (
    <BasketContext.Provider {...rest} value={{
      basket,
      currency,
      order,
      count,
      price,
      basketExpanded,
      basketStep,
      setBasketExpanded,
      setBasketStep,
      collapseBasket: handleCollapse,
      expandBasket: handleExpand,
      addProduct: handleProductAdd,
      deleteProduct: handleProductDelete,
      makeOrder: handleMakeOrder,
    }}>
      {children}
    </BasketContext.Provider>
  );
};

export default BasketProvider;