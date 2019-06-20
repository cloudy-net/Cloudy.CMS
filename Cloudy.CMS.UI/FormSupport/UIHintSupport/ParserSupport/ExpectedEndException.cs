﻿using System;
using System.Runtime.Serialization;

namespace Poetry.UI.FormSupport.UIHintSupport.ParserSupport
{
    public class ExpectedEndException : Exception
    {
        public ExpectedEndException(string data, int position) : base($"Expected UIHint {data} to end at position {position}: {data.Insert(position, "↓")}") { }
    }
}