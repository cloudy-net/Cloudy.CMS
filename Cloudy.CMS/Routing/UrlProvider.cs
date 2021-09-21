﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentSupport.RepositorySupport;

namespace Cloudy.CMS.Mvc.Routing
{
    public class UrlProvider : IUrlProvider
    {
        IContentGetter ContentGetter { get; }
        IAncestorProvider AncestorProvider { get; }

        public UrlProvider(IAncestorProvider ancestorProvider, IContentGetter contentGetter)
        {
            AncestorProvider = ancestorProvider;
            ContentGetter = contentGetter;
        }

        public async Task<string> GetAsync(object content)
        {
            var routable = content as IRoutable;

            if (routable == null)
            {
                return null;
            }

            var hierarchical = content as IHierarchical;

            if (hierarchical == null)
            {
                if(routable.UrlSegment == null)
                {
                    return string.Empty;
                }

                return routable.UrlSegment;
            }

            var allContent = (await AncestorProvider.GetAncestorsAsync(content).ConfigureAwait(false)).Reverse();

            if (allContent.Any(c => !(c is IRoutable)))
            {
                return null;
            }

            var segments = allContent.Cast<IRoutable>().Select(c => c.UrlSegment).ToList();

            if(segments.Any() && segments.First() == null) // root content is allowed to have an empty segment
            {
                segments = segments.Skip(1).ToList();
            }

            if (segments.Contains(null))
            {
                return null;
            }
            
            segments.Add(routable.UrlSegment);

            return "/" + string.Join("/", segments);
        }
    }
}
