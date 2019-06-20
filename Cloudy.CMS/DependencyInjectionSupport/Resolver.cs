﻿using Poetry.DependencyInjectionSupport;
using System;
using System.Collections.Generic;
using System.Text;

namespace Poetry.AspNetCore.DependencyInjectionSupport
{
    public class Resolver : IResolver
    {
        IServiceProvider ServiceProvider { get; }

        public Resolver(IServiceProvider serviceProvider)
        {
            ServiceProvider = serviceProvider;
        }

        public T Resolve<T>()
        {
            return (T)ServiceProvider.GetService(typeof(T));
        }
    }
}
