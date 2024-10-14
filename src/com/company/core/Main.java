package com.company.core;

import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {

        int originalValueVar= 0;

        ArrayList<Integer> originalList = new ArrayList<Integer>();

        originalList.add(1); originalList.add(2); originalList.add(3);

        demoMethod(originalValueVar, originalList);

        System.out.println("Primitive Type behavior: " + originalValueVar);

        System.out.println("Reference Type behavior: " + originalList.get(0));

    }
    public static void demoMethod(int parameterVarValueType, ArrayList<Integer> parameterVarRefType)
    {
        parameterVarValueType = 999;
        parameterVarRefType.set(0,999);
    }
}

