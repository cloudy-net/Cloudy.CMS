﻿using Cloudy.CMS.ContentSupport.RepositorySupport;
using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentTypeSupport;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Linq;

namespace Cloudy.CMS.UI.FormSupport.Controls.SelectSupport
{
    [ItemProvider("content")]
    public class ContentItemProvider : IItemProvider
    {
        public IContentTypeProvider ContentTypeProvider { get; }
        public IContentFinder ContentFinder { get; }
        public IContentGetter ContentGetter { get; }
        public IAncestorProvider AncestorProvider { get; }

        public ContentItemProvider(IContentTypeProvider contentTypeProvider, IContentFinder contentFinder, IContentGetter contentGetter, IAncestorProvider ancestorProvider)
        {
            ContentTypeProvider = contentTypeProvider;
            ContentFinder = contentFinder;
            ContentGetter = contentGetter;
            AncestorProvider = ancestorProvider;
        }

        public async Task<ItemResponse> Get(string type, string value)
        {
            var content = await ContentGetter.GetAsync(type, value).ConfigureAwait(false);

            if(content == null)
            {
                return null;
            }

            var ancestors = await AncestorProvider.GetAncestorsAsync(content).ConfigureAwait(false);

            return new ItemResponse(GetItem(content), ancestors.Select(a => new ItemParent((a as INameable)?.Name ?? a.Id, a.Id)).ToList().AsReadOnly());
        }

        public async Task<IEnumerable<Item>> GetAll(string type, ItemQuery query)
        {
            var result = new List<Item>();

            var contentType = ContentTypeProvider.Get(type);

            foreach (var content in await ContentFinder.FindInContainer(contentType.Container).WithContentType(type).GetResultAsync().ConfigureAwait(false))
            {
                result.Add(GetItem(content));
            }

            return result.AsReadOnly();
        }

        Item GetItem(IContent content) => new Item((content as INameable)?.Name ?? content.Id, null, content.Id, (content as IImageable)?.Image, content is IHierarchical);
    }
}
