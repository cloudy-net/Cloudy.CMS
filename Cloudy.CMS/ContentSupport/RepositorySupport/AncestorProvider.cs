﻿using Cloudy.CMS.ContentSupport.RepositorySupport;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Cloudy.CMS.ContentSupport.RepositorySupport
{
    public class AncestorProvider : IAncestorProvider
    {
        public Task<IEnumerable<object>> GetAncestorsAsync(object content)
        {
            throw new NotImplementedException();
        }
    }
}