import React, {useContext} from 'react';
import {styled, Typography} from '@mui/material';
import BasketContext from './BasketContext.jsx';
import BasketDetails from './BasketDetails.jsx';
import BasketDelivery from './BasketDelivery.jsx';
import {BASKET_STEP} from './BasketProvider.jsx';

const Base = styled('div')`
  padding: 40px 20px 80px;
  height: 124px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Info = styled('div')`
  display: flex;
  align-items: center;
`;

const Count = styled('div')`
  background: ${({theme}) => theme.palette.primary.main};
  border-radius: 50%;
  padding: 4px 12px;
  display: flex;

  color: #fff;

`;
const Price = styled(Typography)`
  display: block;
  margin-left: 20px;
`;
const Action = styled(Typography)`
  display: block;
  font-weight: 500;

  color: ${({theme}) => theme.palette.primary.dark};
`;

const BasketCollapsed = () => {
  const {count, price, currency, expandBasket} = useContext(BasketContext);

  return (
    <Base onClick={expandBasket}>
      <Info>
        <Count>{count}</Count>
        <Price>{price} {currency}</Price>
      </Info>
      <Action>Checkout 􀄫</Action>
    </Base>
  );
};

const Basket = () => {
  const {basket, basketExpanded, basketStep} = useContext(BasketContext);

  if(!basket || basket.products.length === 0) return <></>;

  if(basketExpanded) {
    if (basketStep === BASKET_STEP.delivery) return <BasketDelivery />;
    return <BasketDetails />
  }

  return <BasketCollapsed/>;

};

export default Basket;