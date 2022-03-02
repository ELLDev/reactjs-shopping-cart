import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { validateLocaleAndSetLanguage } from 'typescript';
// import { convertToObject } from 'typescript';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [productsInStock, setProductsInStock] = useState<Stock[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    api.get<Stock[]>(`stock`).then(response => setProductsInStock(response.data));
    api.get<Product[]>(`products`).then(response => setProductsCatalog(response.data));
  },[]);

  const addProduct = async (productId: number) => {
    try {
      let cartCopy = cart;
      const cartProductIndex = cartCopy.findIndex(product => product.id === productId);
      const stockProductIndex = productsInStock.findIndex(product => product.id === productId);
  
      if (cartCopy[cartProductIndex]) {
        if (cartCopy[cartProductIndex].amount + 1 <= productsInStock[stockProductIndex].amount) {
          cartCopy[cartProductIndex].amount += 1;
          setCart(cartCopy);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      } else {
        const productCatalogIndex = productsCatalog.findIndex(product => product.id === productId);
        const newProduct = {
          id: productsCatalog[productCatalogIndex].id,
          title: productsCatalog[productCatalogIndex].title,
          price: productsCatalog[productCatalogIndex].price,
          image: productsCatalog[productCatalogIndex].image,
          amount: 1,
        }
        cartCopy.push(newProduct);
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (cart.length === 1) {
        setCart([]);
        localStorage.setItem('@RocketShoes:cart', '');
      } else {
        let cartCopy = cart;
        cartCopy = cartCopy.filter(product => product.id !== productId);
        setCart(cartCopy);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
      }
    } catch {
        toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {     
      let cartCopy = cart;
      const cartProductIndex = cartCopy.findIndex(product => product.id === productId);
      const stockProductIndex = productsInStock.findIndex(product => product.id === productId);
      
      if (cartCopy[cartProductIndex].amount + amount <= 0 || amount === 0) {
        throw Error;
      } else {
        if (cartCopy[cartProductIndex].amount + amount <= productsInStock[stockProductIndex].amount) {
          cartCopy[cartProductIndex].amount += amount; 
          setCart(cartCopy);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy));
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
