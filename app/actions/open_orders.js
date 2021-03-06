import OrdersList from '../models/OrdersList';
import OpenOrder from '../models/OpenOrder';
import ApiHelper from '../models/ApiHelper';
import open_orders_data from "../api_data/open_orders_data.json";

export const REQUEST_OPEN_ORDERS = 'REQUEST_OPEN_ORDERS';
export const RECEIVE_OPEN_ORDERS = 'RECEIVE_OPEN_ORDERS';
export const OPEN_ORDERS_ERROR = 'OPEN_ORDER_ERROR';

export function requestOpenOrders(forceRefresh) {
  return {
    type: REQUEST_OPEN_ORDERS,
    forceRefresh
  }
}

function openOrdersError(error) {
  console.warn(error); //TODO handle these gracefully
  return {
    type: OPEN_ORDERS_ERROR,
    error
  }
}

export function fetchOpenOrders(forceRefresh) {
  return (dispatch, getState) => {

    // do nothing if we have data already, and they aren't force-refreshing
    if(!forceRefresh && getState().open_orders.orders_list) {
      return;
    }

    if(ApiHelper.stubbing()) {
      dispatch(receiveOpenOrders(open_orders_data));  
      return;
    }

    var uri = ApiHelper.getApiUri('/market/getopenorders');
    fetch(uri, {
      method: 'GET',
      headers: { 'apisign': ApiHelper.getSignature(uri) }
    })
    .then(response => response.json())
    .then(json => dispatch(receiveOpenOrders(json)))
    .catch(error => dispatch(openOrdersError(error)));
  };
}

export function receiveOpenOrders(json) {
  let ordersList = new OrdersList();
  let results = json.result;

  if(results.length > 0) {
    let orders = results.map((ord_data) => { return new OpenOrder(ord_data); });
    ordersList.set(orders);
  }
  return {
    type: RECEIVE_OPEN_ORDERS,
    orders_list: ordersList 
  }
}