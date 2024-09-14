import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { stat } from "fs";

export interface initialStateTypes {
    isSideBarCollapsed: boolean,
    isDarkMode: boolean,
}

const initialState: initialStateTypes = {
    isSideBarCollapsed: false,
    isDarkMode: false,
};

export const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        setIsSideBarCollapsed: (state, action: PayloadAction<boolean>) =>{
            state.isSideBarCollapsed = action.payload
        },
        setIsDarkMode: (state, action: PayloadAction<boolean>) =>{
            state.isDarkMode = action.payload;
        },
    },
});

export const { setIsSideBarCollapsed,setIsDarkMode } = globalSlice.actions;
export default globalSlice.reducer;