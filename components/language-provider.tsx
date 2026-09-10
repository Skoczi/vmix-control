'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {LANGUAGES,isLanguage,translate,type Language} from '@/lib/i18n';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
const Context=createContext({language:'en' as Language,setLanguage:(_value:Language)=>{},t:(source:string,params:Record<string,string|number>={})=>translate(source,'en',params)});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setCurrent]=useState<Language>('en');
 useEffect(()=>{try{const saved=localStorage.getItem('vmix-language');if(isLanguage(saved))setCurrent(saved);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=language;},[language]);
 function setLanguage(value:Language){setCurrent(value);try{localStorage.setItem('vmix-language',value);}catch{}}
 return <Context.Provider value={{language,setLanguage,t:(source,params={})=>translate(source,language,params)}}>{children}</Context.Provider>;
}
export const useLanguage=()=>useContext(Context);
export function LanguageSetting(){const {language,setLanguage,t}=useLanguage();return <div className="language-setting"><label htmlFor="interface-language">{t('Język')}</label><NativeSelect id="interface-language" value={language} onChange={e=>{if(isLanguage(e.target.value))setLanguage(e.target.value);}}>{LANGUAGES.map(([code,name])=><NativeSelectOption key={code} value={code}>{name}</NativeSelectOption>)}</NativeSelect></div>;}
