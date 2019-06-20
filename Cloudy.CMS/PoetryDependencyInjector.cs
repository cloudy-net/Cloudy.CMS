﻿using Poetry.ComponentSupport;
using Poetry.ComponentSupport.DependencySupport;
using Poetry.ComponentSupport.DuplicateComponentIdCheckerSupport;
using Poetry.InitializerSupport;
using Poetry.ComponentSupport.MissingComponentAttributeCheckerSupport;
using Poetry.ComponentSupport.MissingComponentDependencyCheckerSupport;
using Poetry.ComponentSupport.MultipleComponentsInSingleAssemblyCheckerSupport;
using Poetry.ComposableSupport;
using Poetry.DependencyInjectionSupport;
using Poetry.EmbeddedResourceSupport;
using System;
using System.Collections.Generic;
using System.Text;

namespace Poetry
{
    public class PoetryDependencyInjector : IDependencyInjector
    {
        public void InjectDependencies(IContainer container)
        {
            container.RegisterSingleton<IComponentCreator, ComponentCreator>();
            container.RegisterSingleton<IComponentDependencyCreator, ComponentDependencyCreator>();
            container.RegisterSingleton<IComponentDependencySorter, ComponentDependencySorter>();
            container.RegisterSingleton<IComponentProvider, ComponentProvider>();
            container.RegisterSingleton<IComposableProvider, ComposableProvider>();
            container.RegisterSingleton<IMissingComponentAttributeChecker, MissingComponentAttributeChecker>();
            container.RegisterSingleton<IMissingComponentDependencyChecker, MissingComponentDependencyChecker>();
            container.RegisterSingleton<IDuplicateComponentIdChecker, DuplicateComponentIdChecker>();
            container.RegisterSingleton<IMultipleComponentsInSingleAssemblyChecker, MultipleComponentsInSingleAssemblyChecker>();
            container.RegisterSingleton<IInitializerProvider, InitializerProvider>();
            container.RegisterSingleton<IInitializerCreator, InitializerCreator>();
            container.RegisterSingleton<IDependencyInjectorCreator, DependencyInjectorCreator>();
            container.RegisterSingleton<IDependencyInjectorProvider, DependencyInjectorProvider>();
            container.RegisterSingleton<IEmbeddedResourcePathMatcher, EmbeddedResourcePathMatcher>();
            container.RegisterSingleton<IEmbeddedResourceCreator, EmbeddedResourceCreator>();
            container.RegisterSingleton<IEmbeddedResourceProvider, EmbeddedResourceProvider>();
        }
    }
}
