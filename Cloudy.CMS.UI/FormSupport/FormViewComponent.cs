﻿using Cloudy.CMS.ContentSupport.RepositorySupport.PrimaryKey;
using Cloudy.CMS.ContentTypeSupport;
using Cloudy.CMS.UI.FormSupport.FieldSupport;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cloudy.CMS.UI.FormSupport
{
    public class FormViewComponent : ViewComponent
    {
        IFieldProvider FieldProvider { get; }
        IContentTypeProvider ContentTypeProvider { get; }
        IPrimaryKeyPropertyGetter PrimaryKeyPropertyGetter { get; }

        public FormViewComponent(IFieldProvider fieldProvider, IPrimaryKeyPropertyGetter primaryKeyPropertyGetter, IContentTypeProvider contentTypeProvider)
        {
            FieldProvider = fieldProvider;
            PrimaryKeyPropertyGetter = primaryKeyPropertyGetter;
            ContentTypeProvider = contentTypeProvider;
        }

        public async Task<IViewComponentResult> InvokeAsync(string contentType)
        {
            var type = ContentTypeProvider.Get(contentType);

            return View("Form", new FormViewModel
            {
                Fields = FieldProvider.Get(contentType),
                PrimaryKeyNames = PrimaryKeyPropertyGetter.GetFor(type.Type).Select(p => p.Name).ToList().AsReadOnly(),
                New = true,
            });
        }
    }
}